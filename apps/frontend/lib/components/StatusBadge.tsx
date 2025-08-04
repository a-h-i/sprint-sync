'use client';

import {TaskStatus} from "@sprint-sync/enums";
import React from "react";
import Badge from "@/lib/components/Badge";

interface StatusBadgeProps {
    status: TaskStatus;
    children: React.ReactNode;
}

const statusMap = {
    [TaskStatus.TODO]: 'gray' as const,
    [TaskStatus.IN_PROGRESS]: 'blue' as const,
    [TaskStatus.DONE]: 'green' as const,
}

export default function StatusBadge(props: StatusBadgeProps) {
    return <Badge color={statusMap[props.status]}>{props.children}</Badge>
}