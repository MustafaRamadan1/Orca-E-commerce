export const catchAsync = func => (req, res ,next)=>{

    func(req, res ,next).catch(next);
};


