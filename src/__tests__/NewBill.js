/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import store from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";

describe("Given I am connected as an employee", () => {
    let newBill;
    let onNavigate;

    beforeEach(() => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({ type: "Employee", email: "test@company.com" })
        );
        document.body.innerHTML = NewBillUI();
        onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES_PATH[pathname];
        };
        newBill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
        });
    });

    describe("When I upload a file with an invalid format", () => {
        test("Then the file input should be cleared", () => {
            const fileInput = screen.getByTestId("file");
            const file = new File(["file"], "document.pdf", {
                type: "application/pdf",
            });

            fireEvent.change(fileInput, { target: { files: [file] } });

            expect(fileInput.value).toBe("");
        });
    });

    describe("When I upload a valid image file", () => {
        test("Then the store should be called and fileUrl and billId should be set", async () => {
            const fileInput = screen.getByTestId("file");
            const file = new File(["image"], "image.png", {
                type: "image/png",
            });

            const createSpy = jest.spyOn(store.bills(), "create");
            fireEvent.change(fileInput, { target: { files: [file] } });

            await waitFor(() => expect(createSpy).toHaveBeenCalled());
            expect(newBill.fileUrl).toBe(
                "https://localhost:3456/images/test.jpg"
            );
            expect(newBill.billId).toBe("1234");
        });
    });

    describe("When I submit the form", () => {
        test("Then updateBill should be called and I should be navigated to Bills page", () => {
            const updateBillSpy = jest.spyOn(newBill, "updateBill");
            const onNavigateSpy = jest.fn();
            newBill.onNavigate = onNavigateSpy;
            newBill.fileUrl = "https://localhost:3456/images/test.jpg";
            newBill.fileName = "test.jpg";
            const form = screen.getByTestId("form-new-bill");

            fireEvent.change(screen.getByTestId("expense-type"), {
                target: { value: "Transports" },
            });
            fireEvent.change(screen.getByTestId("expense-name"), {
                target: { value: "Taxi" },
            });
            fireEvent.change(screen.getByTestId("amount"), {
                target: { value: "100" },
            });
            fireEvent.change(screen.getByTestId("datepicker"), {
                target: { value: "2022-05-20" },
            });
            fireEvent.change(screen.getByTestId("vat"), {
                target: { value: "20" },
            });
            fireEvent.change(screen.getByTestId("pct"), {
                target: { value: "20" },
            });
            fireEvent.change(screen.getByTestId("commentary"), {
                target: { value: "Business trip" },
            });

            fireEvent.submit(form);

            expect(updateBillSpy).toHaveBeenCalled();
            expect(onNavigateSpy).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
        });
    });
});
