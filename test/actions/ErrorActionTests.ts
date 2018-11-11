import { Injector } from "@furystack/inject";
import { using, usingAsync } from "@sensenet/client-utils";
import { expect } from "chai";
import { IncomingMessage, ServerResponse } from "http";
import { ErrorAction } from "../../src";

export const errorActionTests = describe("ErrorAction tests", () => {
    it("exec", async () => {
        usingAsync(new Injector({parent: undefined}), async (i) => {
            i.SetInstance({}, IncomingMessage);
            i.SetInstance({}, ServerResponse);
            using(i.GetInstance(ErrorAction, true), async (e) => {
                expect(() => e.exec()).to.throw();
            });
        });
    });

    it("returnError", () => {
        const testError = {message: ":("};
        const i = new Injector({parent: undefined});
        i.SetInstance({}, IncomingMessage);
        i.SetInstance({writeHead: () => (undefined), end: (result: string) => {
            expect(result).to.be.eq(JSON.stringify(testError));
        }}, ServerResponse);
        const c = i.GetInstance(ErrorAction, true);
        c.returnError(testError);
    });
});
