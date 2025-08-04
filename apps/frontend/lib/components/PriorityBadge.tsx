'use client';


import {TaskPriority} from "@sprint-sync/enums";
import Badge from "@/lib/components/Badge";
import React from "react";

interface PriorityBadgeProps {
    priority: TaskPriority;
    children: React.ReactNode;
}

const priorityMap = {
    [TaskPriority.LOW]: 'gray' as const,
    [TaskPriority.MEDIUM]: 'yellow' as const,
    [TaskPriority.HIGH]: 'red' as const,
}

export default function PriorityBadge(props: PriorityBadgeProps) {
    return <Badge color={priorityMap[props.priority]}>{props.children}</Badge>
}