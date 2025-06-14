import { Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
import {HttpStatusCode} from '../core/enums/httpStatusCode';
import { sendResponse } from "../core/response/apiResponse";


const prisma = new PrismaClient(); //veritabanı baglantısı

export const createUser = async (req:Request,res:Response) => {
    const {name,id,email,password,role,phone} = req.body;
    try {
        const newUser = await prisma.user.create({
            data: {
                name,
                id,
                email,
                password,
                role,
                phone,
            },
        });
        sendResponse(res,HttpStatusCode.OK,{
            success: true,
            message: 'user succesfully added',
            data: newUser,
        })
    } catch (error) {
        console.log(error);
         sendResponse(res,HttpStatusCode.INTERNAL_SERVER_ERROR,{
            success: false,
            message: 'user cannot added',
        })
    }
}

export const getAllUsers = async (req:Request,res:Response) => {
    try {
        const users = await prisma.user.findMany();

          sendResponse(res,HttpStatusCode.OK,{
            success: true,
            data: users,

        })


    } catch (error) {
        console.log(error);
          sendResponse(res,HttpStatusCode.OK,{
            success: false,
            message: 'cannot list users',
        })        
    }
}
