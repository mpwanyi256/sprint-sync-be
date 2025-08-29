import express from 'express';
import { validateSuggest } from './schema';
import { aiService } from '../../services/ai';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    const { error } = validateSuggest({ title });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await aiService.generateTaskDescription(title);

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('AI suggestion error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate task description' });
    } else {
      res.end();
    }
  }
});

export default router;
