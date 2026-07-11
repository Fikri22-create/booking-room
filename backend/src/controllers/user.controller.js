const User = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const ExcelJS = require('exceljs');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email", "phone", "address", "avatar", "role", "createdAt"],
            order: [["id", "DESC"]]
        });
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ["id", "name", "email", "phone", "address", "avatar", "role", "createdAt"]
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "name", "email", "phone", "address", "avatar", "role", "createdAt"]
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.updateMyProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { name, phone, address } = req.body;
        const updateData = {};

        if (name && name.trim()) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;

        if (req.file) {
            if (user.avatar) {
                const oldPath = path.join(__dirname, "../uploads/", user.avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.avatar = req.file.filename;
        }

        await user.update(updateData);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { old_password, new_password } = req.body;
        if (!old_password || !new_password) {
            return res.status(400).json({ success: false, message: "Old password and new password are required" });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isValid = await bcrypt.compare(old_password, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Old password is incorrect" });
        }
        const hashed = await bcrypt.hash(new_password, 10);
        await user.update({ password: hashed });
        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        next(error);
    }
};

exports.exportUsersExcel = async (req, res, next) => {
    try {
        const users = await User.findAll({
            order: [['id', 'DESC']]
        })
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Users')
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Address', key: 'address', width: 35 },
            { header: 'Role', key: 'role', width: 12 },
            { header: 'Created At', key: 'createdAt', width: 20 }
        ]
        users.forEach((user) => {
            worksheet.addRow({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '-',
                address: user.address || '-',
                role: user.role,
                createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'
            })
        })
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=users.xlsx'
        )
        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        next(error)
    }
}