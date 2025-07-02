import { toast } from "sonner";
const { getToasts } = toast;
export const useToast = () => {
	return {
		info: (msg: string) => toast.info(msg),
		success: (msg: string) => toast.success(msg),
		error: (msg: string) => toast.error(msg),
		warning: (msg: string) => toast.warning(msg),
		message: (msg: string, description?: string) =>
			toast.message(msg, { description }),
		removeAllToasts() {
			const toasts = getToasts();
			console.log(toasts);
			toasts.forEach((t) => toast.dismiss(t.id));
		},
	};
};
