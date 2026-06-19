export declare function createHealthController(serviceName: string): {
    new (): {
        health(): {
            status: string;
            service: string;
        };
        healthCheck(): {
            status: string;
            service: string;
        };
    };
};
