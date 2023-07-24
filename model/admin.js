const Sequelize= require('sequelize');
const sequelize= require('../util/database')

const Admin= sequelize.define('admin',{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey:true,
        autoIncrement: true

    },
    status:{
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
})

module.exports=Admin;