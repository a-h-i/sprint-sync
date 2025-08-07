'use client'
import {createContext} from "react";
import {UserSchemaType} from "@/lib/schemas/user.schema";


export const CurrentUserContext = createContext<UserSchemaType | null>(null)