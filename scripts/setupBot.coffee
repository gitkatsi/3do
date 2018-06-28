module.exports = (robot) ->
    roomid = "372833397346664451" #Test room..
    robot.messageRoom roomid, "I just woke up! Give me a break!"
    robot.adapter.client.user.setGame("Yoda is our Lord and Saviour")
    