
import ForumPost from '../Models/Forum.js';

// 👇 Create a new forum post (POST /api/posts)
export const createForumPost = async (req, res) => {
  try {
    const { title, description , reportedBy } = req.body;
    const userId = req.user?.id || req.body.user; // either from auth middleware or directly from body
     

    if (!userId) return res.status(400).json({ message: 'User ID is required' });
  

    const post = new ForumPost({
      user: userId,
      title,
      description,
      reportedBy
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// 👇 Get all forum posts (GET /api/posts)
export const getAllForumPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
    .populate('user', 'username firstName lastName role')
    .populate('reportedBy', 'username firstName lastName role')
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};
