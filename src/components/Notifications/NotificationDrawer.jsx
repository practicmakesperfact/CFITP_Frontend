import { useEffect } from "react";
import Pusher from "pusher-js";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

useEffect(() => {
  const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  });

  const channel = pusher.subscribe(`user.${userId}`);
  channel.bind("notification", (data) => {
    queryClient.invalidateQueries(["notifications"]);
    toast.success(data.message);
  });

  return () => pusher.disconnect();
}, []);
