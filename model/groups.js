const Sequelize= require('sequelize');
const sequelize= require('../util/database')

const Groups= sequelize.define('groups',{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey:true,
        autoIncrement: true

    },
    name:{
        type: Sequelize.STRING,
        allowNull: false,
        unique:true
    }
})

module.exports=Groups;