// routes/forumPostRoutes.js
import express from 'express';
import { createForumPost, getAllForumPosts } from '../Controllers/forumController.js';
import {isAuthenticated} from '../Middleware/authuser.js';

const router = express.Router();

// 👇 POST request to create a new forum post
router.post('/create', isAuthenticated, createForumPost);

// 👇 GET request to fetch all forum posts
router.get('/get', isAuthenticated, getAllForumPosts);

export default router;
