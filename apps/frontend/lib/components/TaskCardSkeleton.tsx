


function Skeleton({className}: { className: string}) {
    return (
        <div className={`animate-pulse rounded-md bg-gray ${className}`}/>
    )
}


export default function TaskCardSkeleton() {
    return (
        <div className="animate-pulse rounded-md border p-3 shadow-sm bg-gray-200 space-y-2">
            {/* Simulated ID */}
            <Skeleton className="h-4 w-1/4 rounded" />

            {/* Simulated badges */}
            <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
        </div>
    );
}