import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.render('dashboard');
});

// Handle board creation
router.post('/create-board', (req, res) => {
  const { boardName, classCode, tags } = req.body;
  
  console.log('Creating new board:', {
    name: boardName,
    class: classCode,
    tags: tags
  });
  
  // Here you would typically:
  // 1. Validate the input data
  // 2. Generate a unique board ID
  // 3. Save to database
  // 4. Redirect to the whiteboard with the new board ID
  
  // For now, let's just redirect to whiteboard
  // You can pass data via query parameters temporarily
  const queryParams = new URLSearchParams({
    name: boardName,
    class: classCode,
    tags: tags
  });
  
  res.redirect(`/whiteboard?${queryParams}`);
});

export default router;