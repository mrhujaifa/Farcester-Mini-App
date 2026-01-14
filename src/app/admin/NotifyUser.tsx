import React, { useEffect, useState } from "react";
import { MiniAppNotificationDetails } from "@farcaster/miniapp-core";
import { useMutation } from "@tanstack/react-query";
import { useMiniApp } from "@neynar/react";
import { notificationsBtn } from "~/lib/constants";

const NotifyUsers = () => {
  const { context, actions } = useMiniApp();
  const [result, setResult] = useState<string | null>(null);
  const [notificationDetails, setNotificationDetails] =
    useState<MiniAppNotificationDetails | null>(null);

  const fid = context?.user?.fid;

  useEffect(() => {
    if (context?.user?.fid) {
      setNotificationDetails(context?.client.notificationDetails ?? null);
    }
  }, [context]);

  const { mutate: sendNotification, isPending: isSendingNotification } =
    useMutation({
      mutationFn: async ({ title, body }: { title: string; body: string }) => {
        return await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            body,
          }),
        });
      },
      onSuccess: (response) => {
        console.log(response);
        if (response.status === 200) setResult("Notification sent!");
        else if (response.status === 429)
          setResult("Rate limited. Try again later.");
        else setResult("Error sending notification.");
      },
      onError: (error) => {
        console.log(error);
        setResult("Error sending notification.");
      },
    });
  return (
    <div className="w-full flex flex-col items-center gap-2 bg-white rounded-2xl shadow-lg p-2">
      <div>
        <h1 className="text-blue-600 text-md font-bold">Send Notifications</h1>
      </div>
      <div className="w-full grid grid-cols-2 items-center gap-2 ">
        {notificationsBtn.map((notify: any) => (
          <button
            key={notify.id}
            disabled={isSendingNotification}
            onClick={() =>
              sendNotification({
                title: notify.title,
                body: notify.body,
              })
            }
            className="py-2 px-3 bg-blue-600 rounded-2xl text-white"
          >
            {isSendingNotification ? "Sending..." : notify.name}
          </button>
        ))}
      </div>

      {result && <p className="mt-2 text-sm text-black">{result}</p>}
    </div>
  );
};

export default NotifyUsers;
