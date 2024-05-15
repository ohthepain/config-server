
checkDuplicateEmail = async (req, res, next) => {
    const email = req.body.email
    try {
        prisma = req.prisma
        const exists = await prisma.user.findUnique({ where: { email: email } });
        if (exists) {
            res.status(400).send({
                message: "Failed! Duplicate email = " + email
            });
            return;
        }
    } catch (error) {
        console.log(error)
        next(error)
    }

    next();
};

checkRolesExist = async (req, res, next) => {
    const roles = req.body.roles
    try {
        prisma = req.prisma
        if (roles) {
            for (let i = 0; i < roles.length; i++) {
                const query = { where: { name: roles[i] } };
                if (!await prisma.role.findUnique(query)) {
                    res.status(400).send({
                        message: "Failed! Role does not exist = " + req.body.roles[i]
                    });
                    return;
                }
            }
        }
    } catch (error) {
        console.log(error)
        next(error)
    }

    next();
};

module.exports = { checkDuplicateEmail, checkRolesExist }
