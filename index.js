const express = require('express');
const admin = require('firebase-admin');
const { cert } = require('firebase-admin/app');

const app = express();
app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: cert(serviceAccount)
});

app.post('/send-push', async (req, res) => {
  // Логируем сам факт того, что запрос пришел
  console.log('--- Получен запрос на отправку пуша! ---');
  console.log('Тело запроса:', req.body);

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    console.error('Ошибка: Переданы не все поля!');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const message = {
    notification: { title, body },
    token: token,
    android: {
      priority: 'high',
      notification: {
        channelId: 'main_channel',
        importance: 'max',
        priority: 'high',
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Успешно отправлено в Firebase! ID сообщения:', response);
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Ошибка отправки в Firebase:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
