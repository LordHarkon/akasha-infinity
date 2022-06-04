interface IResult {
    status: "success" | "failure";
    result?: unknown;
    message?: string;
}

export async function handleAsyncErrors(callback: Function): Promise<IResult> {
    try {
        return {
            status: "success",
            result: await callback(),
        };
    } catch (error: unknown) {
        return { status: "failure", message: (error as Error).message };
    }
}

export function handleErrors(callback: Function): IResult {
    try {
        return {
            status: "success",
            result: callback(),
        };
    } catch (error: unknown) {
        return { status: "failure", message: (error as Error).message };
    }
}
