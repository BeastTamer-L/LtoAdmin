import Modal from "./Modal";

// The logout confirmation uses the same modal as every other confirmation
export default function LogoutModal({
    isOpen,
    onClose,
    onConfirm
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Log out?"
            description="Are you sure you want to log out of your session?"
            confirmText="Log out"
            cancelText="Cancel"
        />
    );
}
