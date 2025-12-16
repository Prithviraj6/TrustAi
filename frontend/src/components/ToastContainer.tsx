import { useToast } from '../context/ToastContext';
import Toast from './Toast';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}
