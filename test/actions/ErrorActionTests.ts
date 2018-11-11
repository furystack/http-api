import { Injector } from "@furystack/inject";
import { using, usingAsync } from "@sensenet/client-utils";
import { expect } from "chai";
import { IncomingMessage, ServerResponse } from "http";
import { ErrorAction } from "../../src";

export const errorActionTests = describe("ErrorAction tests", () => {
    it("exec", (done: MochaDone) => {
        usingAsync(new Injector({parent: undefined}), async (i) => {
            i.SetInstance({}, IncomingMessage);
            i.SetInstance({}, ServerResponse);
            await usingAsync(i.GetInstance(ErrorAction, true), async (e) => {
                try {
                    await e.exec();
                    done("Should throw");
                } catch (error) {
                    done();
                }
            });
        });
    });

    it("returnError", (done: MochaDone) => {
        const testError = {message: ":("};
        usingAsync(new Injector({parent: undefined}), async (i) => {
            i.SetInstance({}, IncomingMessage);
            i.SetInstance({writeHead: () => (undefined), end: (result: string) => {
                expect(result).to.be.eq(JSON.stringify(testError));
                done();
            }}, ServerResponse);
            await usingAsync(i.GetInstance(ErrorAction, true), async (c) => {
                c.returnError(testError);
            });
        });
    });
});
