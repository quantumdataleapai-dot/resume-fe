import { useEffect } from "react";
import ReactDOM from "react-dom";

// This component renders its children into a DOM node that exists outside
// the DOM hierarchy of the parent component
const ModalPortal = ({ children }) => {
  // Create a div that we'll render the modal into
  const modalRoot = document.getElementById("modal-root");

  // If modal root doesn't exist, create it
  useEffect(() => {
    if (!modalRoot) {
      const root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
      return () => {
        document.body.removeChild(root);
      };
    }
  }, [modalRoot]);

  // Get the modal container
  const el =
    document.getElementById("modal-root") || document.createElement("div");

  // Use a portal to render the children into the element
  return ReactDOM.createPortal(
    // Any valid React child: JSX, strings, arrays, etc.
    children,
    // A DOM element
    el
  );
};

export default ModalPortal;
