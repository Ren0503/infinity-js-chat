import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel';
import Chat from '../models/chatModel';

const getMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name avatar email')
            .populate({
                path: 'chat',
                populate: { path: 'users', select: 'avatar name email' }
            })

        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    const newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        let message = await new Message(newMessage).save();

        message = await message
            .populate('sender', 'name avatar email')
            .populate({
                path: 'chat',
                populate: { path: 'users', select: 'avatar name email' }
            })
            .execPopulate()

        await Chat.findByIdAndUpdate({ _id: chatId }, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

export {
    getMessages,
    sendMessage,
}