/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import Router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);
console.log = jest.fn();
describe("Given I am connected as an employee", () => {
    let onNavigate;
    let newBill;
    beforeEach(() => {
        document.body.innerHTML = NewBillUI();
        onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({ type: "Employee", email: "employee@test.com" })
        );
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("When I am on NewBill Page", () => {
        test("Then bill file should be updated", async () => {
            // const store = jest.fn();
            newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });
            const form = screen.getByTestId("form-new-bill");
            expect(form).toBeTruthy();
            const handleFile = jest.fn((e) => newBill.handleChangeFile(e));

            const formFile = screen.getByTestId("file");
            expect(formFile).toBeTruthy();
            formFile.addEventListener("change", handleFile);
            fireEvent.change(formFile);
            expect(handleFile).toHaveBeenCalled();
        });

        test("Then the submit form should be handled", async () => {
            newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const form = screen.getByTestId("form-new-bill");
            expect(form).toBeTruthy();
            const handleSubmitMock = jest.fn((e) => newBill.handleSubmit(e));

            form.addEventListener("submit", handleSubmitMock);
            fireEvent.submit(form);
            expect(handleSubmitMock).toHaveBeenCalled();
        });

        test.skip("Then submit new bill to mock API POST", async () => {
            jest.spyOn(mockStore, "bills");
            const spyCreate = jest.spyOn(mockStore.bills(), "create");
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            Router();
            window.onNavigate(ROUTES_PATH.NewBill);
            newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            mockStore.bill = jest.fn(() => ({
                create: jest.fn(() =>
                    Promise.resolve({
                        fileUrl: "https://localhost:3456/images/test.jpg",
                        key: "1234",
                    })
                ),
            }));

            console.log("mockStore in NewBill:", newBill.store);
            expect(newBill.store).toBe(mockStore);
            const handleChangeFile = jest.fn((e) =>
                newBill.handleChangeFile(e)
            );
            const fileInput = screen.getByTestId("file");
            const mockFile = new File(["test"], "test.jpg", {
                type: "image/jpg",
            });
            // global.FormData = jest.fn(() => ({ append: jest.fn() }));
            fileInput.addEventListener("change", handleChangeFile);
            fireEvent.change(fileInput, { target: { files: [mockFile] } });
            await waitFor(() => expect(handleChangeFile).toHaveBeenCalled());
            await waitFor(() => {
                expect(newBill.fileUrl).toBe(
                    "https://localhost:3456/images/test.jpg"
                );
            });
        });
        test.skip("Then the new bill should be sent to the API", async () => {
            jest.spyOn(mockStore.bills(), "create");
            const form = screen.getByTestId("form-new-bill");
            fireEvent.submit(form);

            await waitFor(() =>
                expect(mockStore.bills().create).toHaveBeenCalledTimes(1)
            );
        });
        test("Mock store bills().create is properly defined", () => {
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
        test.skip("Then test mocks", async () => {
            // window.onNavigate(ROUTES_PATH.NewBill);
            // const newBill = new NewBill({
            //     document,
            //     onNavigate,
            //     store: mockStore,
            //     localStorage: window.localStorage,
            // });
            const newBill = new NewBill({ document, store: mockStore });
            const handleChangeFile = jest.fn(newBill.handleChangeFile);

            mockStore.bills = jest.fn(() => ({
                create: jest.fn(() => {
                    console.log("mockStore.bill().create called");
                    return Promise.resolve({
                        fileUrl: "https://localhost:3456/images/test.jpg",
                        key: "1234",
                    });
                }),
            }));

            // Simuler un fichier sélectionné
            const inputFile = screen.getByTestId("file");
            inputFile.addEventListener("change", handleChangeFile);
            fireEvent.change(inputFile, {
                target: {
                    files: [
                        new File(["test"], "test.jpg", { type: "image/jpeg" }),
                    ],
                },
            });

            expect(handleChangeFile).toHaveBeenCalled();
            await waitFor(() =>
                expect(newBill.fileUrl).toBe(
                    "https://localhost:3456/images/test.jpg"
                )
            );
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

            // Instanciation de NewBill
            newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            // Mock du fichier
            const mockFile = new File(["test"], "test.jpg", {
                type: "image/jpg",
            });

            // Mock FormData pour éviter les erreurs
            global.FormData = jest.fn(() => ({
                append: jest.fn(),
            }));
            mockStore.bills = jest.fn(() => ({
                create: jest.fn(() =>
                    Promise.resolve({
                        fileUrl: "https://localhost:3456/images/test.jpg",
                        key: "1234",
                    })
                ),
            }));

            // Simulation de l'événement de changement de fichier
            const handleChangeFile = jest.fn((e) =>
                newBill.handleChangeFile(e)
            );
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
        test.skip("Then submit new bill to mock API POST", async () => {
            newBill = new NewBill({ document, store: mockStore });
            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            mockStore.bills.mockImplementation(() => ({
                create: jest.fn().mockResolvedValue({
                    fileUrl: "https://localhost:3456/images/test.jpg",
                }),
            }));

            // Simuler un fichier sélectionné
            const inputFile = screen.getByTestId("file");
            inputFile.addEventListener("change", handleChangeFile);
            fireEvent.change(inputFile, {
                target: {
                    files: [
                        new File(["test"], "test.jpg", { type: "image/jpeg" }),
                    ],
                },
            });

            expect(handleChangeFile).toHaveBeenCalled();
            await waitFor(() =>
                expect(newBill.fileUrl).toBe(
                    "https://localhost:3456/images/test.jpg"
                )
            );
        });
        test("Mock store bills().create is properly defined", async () => {
            const mockBills = mockStore.bills();
            expect(mockBills.create).toBeDefined();
            expect(typeof mockBills.create).toBe("function");

            const response = await mockBills.create();
            expect(response.fileUrl).toBe(
                "https://localhost:3456/images/test.jpg"
            );
        });
        test.skip("Then submit new bill to mock API POST", async () => {
            const spyBills = jest.spyOn(mockStore, "bills");
            mockStore.bills.mockImplementation(() => ({
                create: jest.fn(() =>
                    Promise.resolve({
                        fileUrl: "https://localhost:3456/images/test.jpg",
                        key: "1234",
                    })
                ),
            }));

            newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            // Simuler le changement de fichier
            const handleChangeFile = jest.fn((e) =>
                newBill.handleChangeFile(e)
            );
            const fileInput = screen.getByTestId("file");
            fileInput.addEventListener("change", handleChangeFile);

            const mockFile = new File(["content"], "test.jpg", {
                type: "image/jpg",
            });
            fireEvent.change(fileInput, { target: { files: [mockFile] } });
            spyBills.mockImplementation(() => ({
                create: jest.fn(() =>
                    Promise.resolve({ fileUrl: "https://localhost/test.jpg" })
                ),
            }));

            // Vérifications
            await waitFor(() => {
                expect(handleChangeFile).toHaveBeenCalled();
                expect(newBill.fileUrl).toBe(
                    "https://localhost:3456/images/test.jpg"
                );
            });

            const form = screen.getByTestId("form-new-bill");
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockStore.bills().create).toHaveBeenCalledTimes(1);
            });
        });
        test("ths", async () => {
            const spyBills = jest.spyOn(mockStore, "bills");

            // Modifier temporairement la méthode bills
            spyBills.mockImplementation(() => ({
                create: jest.fn(() =>
                    Promise.resolve({
                        fileUrl: "https://localhost:3456/images/test.jpg",
                        key: "1234",
                    })
                ),
            }));

            // Initialisation de NewBill

            newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            // Simulation du changement de fichier
            const handleChangeFile = jest.fn((e) =>
                newBill.handleChangeFile(e)
            );
            const fileInput = screen.getByTestId("file");
            fileInput.addEventListener("change", handleChangeFile);

            const mockFile = new File(["test"], "test.jpg", {
                type: "image/jpg",
            });
            fireEvent.change(fileInput, { target: { files: [mockFile] } });

            await waitFor(() => {
                expect(handleChangeFile).toHaveBeenCalled();
                // expect(newBill.fileUrl).toBe(
                //     "https://localhost:3456/images/test.jpg"
                // );
            });

            // Simulation de l'envoi du formulaire
            const form = screen.getByTestId("form-new-bill");
            fireEvent.submit(form);

            await waitFor(() => {
                // Vérifie que la méthode create a été appelée
                expect(mockStore.bills().create).toHaveBeenCalledTimes(1);
                expect(mockStore.bills().create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        fileUrl: "https://localhost:3456/images/test.jpg",
                    })
                );
            });

            // Vérifie si spyBills a été utilisé
            expect(spyBills).toHaveBeenCalled();

            // Réinitialisation du mock pour éviter les interférences
            jest.restoreAllMocks();
        });
    });
});
