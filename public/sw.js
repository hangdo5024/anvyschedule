self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "AnvySchedule";
  const options = {
    body: data.body || "Bạn có lịch học sắp tới!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: data.url || "/",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});
