import { toast } from "react-hot-toast";

export const incomingMessage = (user) => {
  return toast.custom(
    (t) => <IncomingMessageToast toastObj={t} user={user} />,
    {
      duration: 8000,
    }
  );
};

const IncomingMessageToast = ({ toastObj, user }) => {
  return (
    <div
      className={`${
        toast.visible ? "animate-fade-in-up" : "animate-fade-out-down"
      } max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex items-center ring-1 ring-gray-200 p-4 gap-4`}
    >
      {/* User Image */}
      <img
        className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500"
        src={user?.image}
        alt={user?.name}
      />

      {/* Text Content */}
      <div className="flex-1 overflow-hidden">
        <p className="text-base font-semibold text-gray-800 truncate">
          {user?.name}
        </p>
        <p className="text-sm text-gray-500 truncate">{user?.message}</p>
      </div>

      {/* Close Button */}
      <button
        style={{ cursor: "pointer" }}
        onClick={() => toast.dismiss(toastObj.id)}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        Close
      </button>
    </div>
  );
};
