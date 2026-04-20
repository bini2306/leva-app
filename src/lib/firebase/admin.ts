import admin from "firebase-admin";

// Singleton: inizializza Firebase Admin una sola volta
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      // Le newline \\n nel .env devono essere convertite
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const messaging = admin.messaging();

export interface NotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  payload: NotificationPayload
): Promise<void> {
  await messaging.send({
    token: payload.token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data,
    apns: {
      payload: {
        aps: { sound: "default" },
      },
    },
    android: {
      notification: { sound: "default" },
    },
  });
}

export async function sendPushToMultiple(
  payloads: NotificationPayload[]
): Promise<void> {
  if (payloads.length === 0) return;

  await messaging.sendEach(
    payloads.map((p) => ({
      token: p.token,
      notification: { title: p.title, body: p.body },
      data: p.data,
    }))
  );
}
