import runTasks from "./runTasks";

export const run = async (): Promise<void> => {
    await runTasks();
};

void run();
