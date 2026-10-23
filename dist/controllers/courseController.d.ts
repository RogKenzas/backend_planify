import type { Request, Response } from 'express';
declare const _default: {
    getCourses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getCourseById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export = _default;
//# sourceMappingURL=courseController.d.ts.map