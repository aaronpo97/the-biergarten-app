import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import ToastProvider from "../app/components/toast/ToastProvider";
import {
  dismissToasts,
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../app/components/toast/toast";

function ToastDemo() {
  return (
    <div className="space-y-4">
      <ToastProvider />
      <div className="card border border-base-300 bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Toast demo</h2>
          <p className="text-sm text-base-content/70">Use these actions to preview toast styles.</p>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-success btn-sm"
              onClick={() => showSuccessToast("Saved successfully")}
            >
              Success
            </button>
            <button
              className="btn btn-error btn-sm"
              onClick={() => showErrorToast("Something went wrong")}
            >
              Error
            </button>
            <button
              className="btn btn-info btn-sm"
              onClick={() => showInfoToast("Heads up: check your email")}
            >
              Info
            </button>
            <button className="btn btn-ghost btn-sm" onClick={dismissToasts}>
              Dismiss all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Feedback/Toast",
  component: ToastDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /success/i }));
    await expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
  },
};
