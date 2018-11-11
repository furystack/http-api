import { LoggerCollection } from "@furystack/core";
import { Injector } from "@furystack/inject";
import { usingAsync } from "@sensenet/client-utils";
import { expect } from "chai";
import { IncomingMessage, ServerResponse } from "http";
import { HttpApiConfiguration } from "../src";
import { HttpApi } from "../src/HttpApi";

export const httpApiTests = describe("HttpApi tests", () => {
    it("Can be constructed", async () => {
        usingAsync(new Injector({parent: undefined, owner: "Test"}), async (i) => {
            i.SetInstance(new HttpApiConfiguration());
            i.SetInstance({}, IncomingMessage);
            i.SetInstance({}, ServerResponse);
            i.SetInstance(i);
            i.SetInstance(new LoggerCollection());
            await usingAsync(i.GetInstance(HttpApi, true), async (api) => {
                expect(api).to.be.instanceof(HttpApi);
            });

        });
    });

});
