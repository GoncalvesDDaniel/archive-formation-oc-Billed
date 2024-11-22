/**
 * @jest-environment jsdom
 */

import {
    getAllByTestId,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/dom";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import "@testing-library/jest-dom/extend-expect.js";

import router from "../app/Router.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            //to-do write expect expression
            const windowIconClass = windowIcon.classList;
            expect(windowIconClass).toContain("active-icon");
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => new Date(b) - new Date(a);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
        test("Then, it should open modal when new bill button is clicked", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const billsConstructor = new Bills({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
                handleClickNewBill: jest.fn(),
            });

            const clickNewBill = jest.fn(billsConstructor.handleClickNewBill);
            const buttonNewBill = screen.getByTestId("btn-new-bill");
            expect(buttonNewBill).toBeTruthy();
            buttonNewBill.addEventListener("click", () => clickNewBill());
            userEvent.click(buttonNewBill);
            expect(clickNewBill).toHaveBeenCalled();
            expect(screen.getByTestId("form-new-bill")).toBeVisible();
        });
        test("Then, it should open the related bill when eye icon button is clicked", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const billsConstructor = new Bills({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
                handleClickIconEye: jest.fn(),
            });
            // const mockIconEye = document.createElement("div");
            // mockIconEye.id = "eye";
            // mockIconEye.dataset.testid = "icon-eye";
            // mockIconEye.dataset.billUrl =
            //     "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a";
            $.fn.modal = jest.fn();
            const handleClickIconEye = jest.fn(
                billsConstructor.handleClickIconEye
            );

            const buttonsIconEye = screen.getAllByTestId("icon-eye");

            expect(buttonsIconEye).toBeTruthy();
            buttonsIconEye.forEach((btn) =>
                btn.addEventListener("click", handleClickIconEye(btn))
            );
            // fireEvent("click", buttonsIconEye[0]);
            userEvent.click(buttonsIconEye[0]);
            expect(handleClickIconEye).toHaveBeenCalled();
        });

        test(" GET Bills", async () => {
            localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            const mockedStore = store;
            const billsConstructor = new Bills({
                document,
                onNavigate,
                store: mockedStore,
                localStorage: window.localStorage,
            });
            const getBills = jest.fn(billsConstructor.getBills);
            const results = await getBills();
            expect(results.length).toBe(4);
        });
    });
});
