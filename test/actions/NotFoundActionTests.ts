import { Injector } from "@furystack/inject";
import { usingAsync } from "@sensenet/client-utils";
import { expect } from "chai";
import { IncomingMessage, ServerResponse } from "http";
import { NotFoundAction } from "../../src";

export const notFoundActionTests = describe("NotFoundAction tests", () => {
    it("exec", (done: MochaDone) => {
        const notFoundResponse = { Error: "Content not found", url: "https://google.com" };
        usingAsync(new Injector({parent: undefined}), async (i) => {
            i.SetInstance({url: "https://google.com"}, IncomingMessage);
            i.SetInstance({writeHead: () => (undefined), end: (result: string) => {
                expect(result).to.be.eq(JSON.stringify(notFoundResponse));
                done();
            }}, ServerResponse);
            await usingAsync(i.GetInstance(NotFoundAction, true), async (c) => {
                await c.exec();
            });
        });
    });
});
