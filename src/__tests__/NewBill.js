/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor, getByTestId } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Router from "../app/Router.js";
import { userEvent } from "@testing-library/user-event";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test.skip("Mock store bills().create is properly defined", async () => {
            const billsInstance = mockStore.bills();
            expect(billsInstance.create).toBeDefined();
            expect(typeof billsInstance.create).toBe("function");

            return billsInstance.create().then((response) => {
                expect(response.fileUrl).toBe(
                    "https://localhost:3456/images/test.jpg"
                );
                expect(response.key).toBe("1234");
            });
        });
        test("Then the new bill form should be displayed correctly", () => {
            document.body.innerHTML = NewBillUI();
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
            expect(screen.getByTestId("file")).toBeTruthy();
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });
        test("Then if the file extension is invalid, it should not call the store and reset the input", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
                writable: true,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "employee@test.com" })
            );

            document.body.innerHTML = NewBillUI();

            const onNavigateMock = jest.fn();

            const newBillInstance = new NewBill({
                document,
                onNavigate: onNavigateMock,
                store: mockStore,
                localStorage: window.localStorage,
            });

            const createBillSpy = jest.spyOn(
                newBillInstance.store.bills(),
                "create"
            );

            const formFile = screen.getByTestId("file");

            const invalidFile = new File(["content"], "document.txt", {
                type: "text/plain",
            });

            fireEvent.change(formFile, {
                target: { files: [invalidFile] },
            });

            expect(createBillSpy).not.toHaveBeenCalled();
            expect(formFile.value).toBe("");

            createBillSpy.mockRestore();
        });
        test.skip("Then bill file should be updated", () => {
            const form = screen.getByTestId("form-new-bill");
            expect(form).toBeTruthy();
            const handleFile = jest.fn((e) =>
                newBillInstance.handleChangeFile(e)
            );

            const formFile = screen.getByTestId("file");
            expect(formFile).toBeTruthy();
            formFile.addEventListener("change", handleFile);
            fireEvent.change(formFile);
            expect(handleFile).toHaveBeenCalled();
        });

        test("Then the submit form should be handled", () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });

            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );
            document.body.innerHTML = NewBillUI();
            const newBillInstance = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const form = screen.getByTestId("form-new-bill");
            expect(form).toBeTruthy();
            const handleSubmitMock = jest.fn((e) =>
                newBillInstance.handleSubmit(e)
            );

            // form.addEventListener("submit", handleSubmitMock);
            fireEvent.submit(form);
            expect(handleSubmitMock).toHaveBeenCalled();
        });

        test.skip("Then submit new bill to mock API POST", async () => {
            // console.log("mockStore in NewBill:", newBill.store);
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });

            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );
            document.body.innerHTML = NewBillUI();
            const newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            expect(newBill.store).toBe(mockStore);
            const handleChangeFile = jest.fn((e) =>
                newBill.handleChangeFile(e)
            );
            const fileInput = screen.getByTestId("file");
            const mockFile = new File(["test"], "test.jpg", {
                type: "image/jpg",
            });
            global.FormData = jest.fn(() => ({ append: jest.fn() }));
            fileInput.addEventListener("change", handleChangeFile);
            fireEvent.change(fileInput, { target: { files: [mockFile] } });
            await waitFor(() => expect(handleChangeFile).toHaveBeenCalled());
            await waitFor(() => {
                expect(newBill.fileUrl).toBe(
                    "https://localhost:3456/images/test.jpg"
                );
            });
        });
        test.skip("mockStore.bills() should return an object with create and update methods", () => {
            const billsInstance = mockStore.bills();
            expect(typeof billsInstance).toBe("object");
            expect(typeof billsInstance.create).toBe("function");
            expect(typeof billsInstance.update).toBe("function");
        });
        test.skip("Then the new bill should be sent to the API", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    create: () => {
                        return Promise.resolve({
                            fileUrl: "https://example.com/test.png",
                            key: "12345",
                        });
                    },
                };
            });
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });

            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );

            document.body.innerHTML = NewBillUI();
            const fileInput = screen.getByTestId("file");
            const newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const handleChangeFile = jest.fn((e) =>
                newBill.handleChangeFile(e)
            );
            fileInput.addEventListener("change", handleChangeFile);
            const file = new File(["content"], "test.png", {
                type: "image/png",
            });
            fireEvent.change(fileInput, { target: { files: [file] } });
            // await new Promise(process.nextTick);
            await waitFor(() => {
                expect(newBill.fileUrl).toBe("https://example.com/test.png");
                expect(newBill.billId).toBe("12345");
            });

            expect(handleChangeFile).toHaveBeenCalled();
        });
        test.skip("Then submit new bill to mock API POST", async () => {
            jest.spyOn(mockStore, "bills"); // Assure que la méthode bills est bien appelée
            const spyCreate = jest.spyOn(mockStore.bills(), "create");

            // Mock de l'objet localStorage
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );

            // Initialisation de l'interface
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            Router(); // Initialise les routes
            window.onNavigate(ROUTES_PATH.NewBill); // Simule la navigation vers NewBill

            document.body.innerHTML = NewBillUI();
            // Mock du fichier
            const mockFile = new File(["test"], "test.jpg", {
                type: "image/jpg",
            });

            // Mock FormData pour éviter les erreurs
            global.FormData = jest.fn(() => ({
                append: jest.fn(),
            }));

            const newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            // Simulation de l'événement de changement de fichier
            const handleChangeFile = jest.fn((e) =>
                newBill.handleChangeFile(e)
            );
            screen.debug();
            const fileInput = screen.getByTestId("file");
            fileInput.addEventListener("change", handleChangeFile);
            fireEvent.change(fileInput, { target: { files: [mockFile] } });

            // Vérifications après l'événement
            await waitFor(() => {
                expect(handleChangeFile).toHaveBeenCalled();
                expect(newBill.fileUrl).toBe(
                    "https://localhost:3456/images/test.jpg"
                );
                expect(spyCreate).toHaveBeenCalled();
            });
        });
    });
});
// J'ai pas envi d'insulter mais ca fait 2 semaines je suis sur vos tests merdiques... vous pouvez meme pas savoir comme j'ai la haine
