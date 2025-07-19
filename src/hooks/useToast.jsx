import { toast } from "sonner";
const { getToasts } = toast;
export const useToast = () => {
	return {
		info: (msg) => toast.info(msg),
		success: (msg) => toast.success(msg),
		error: (msg) => toast.error(msg),
		warning: (msg) => toast.warning(msg),
		message: (msg, description) =>
			toast.message(msg, { description }),
		removeAllToasts() {
			const toasts = getToasts();
			console.log(toasts);
			toasts.forEach((t) => toast.dismiss(t.id));
		},
	};
};
