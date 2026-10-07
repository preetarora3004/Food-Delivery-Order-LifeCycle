import { type PrismaClient } from "@workspace/db/generated/prisma/client"

export class Repository {
    public readonly client: PrismaClient

    constructor(client: PrismaClient) {
        this.client = client
    }

}
