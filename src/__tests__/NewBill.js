/**
 * @jest-environment jsdom
 */
import {
    fireEvent,
    getAllByTestId,
    getByRole,
    screen,
} from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect.js";
import userEvent from "@testing-library/user-event";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import Router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then bill file should be updated", async () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });

            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );

            // const store = jest.fn();

            const newBill = new NewBill({
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
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });

            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );

            const newBill = new NewBill({
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

        test("Then fetches new bill to mock API POST", async () => {
            jest.spyOn(mockStore, "bills");
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "a@a",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            Router();

            mockStore.bills.mockImplementation(() => {
                return {
                    create: () => {
                        return Promise.resolve({
                            fileUrl: "https://localhost:3456/images/test.jpg",
                            key: "1234",
                        });
                    },
                };
            });
            window.onNavigate(ROUTES_PATH.NewBill);
            await new Promise(process.nextTick);
            const post = await bills;
            expect(post).toHaveBeenCalled();
        });
    });
});
