import { Controller } from "../controller/controller";
import { Service } from "../service/service";
import { Repository } from "../repository/repository";
import { prisma } from "@workspace/db/client"

const repository = new Repository(prisma);

export const service = new Service(repository);
export const controller = new Controller(service);
