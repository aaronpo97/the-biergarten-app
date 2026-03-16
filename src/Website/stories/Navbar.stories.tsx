import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import Navbar from "../app/components/Navbar";

const meta = {
  title: "Navigation/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  args: {
    auth: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: /the biergarten app/i })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /login/i })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /register user/i })).toBeInTheDocument();
  },
};

export const Authenticated: Story = {
  args: {
    auth: {
      username: "Hans",
      accessToken: "access-token",
      refreshToken: "refresh-token",
      userAccountId: "user-1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const userButton = canvas.getByRole("button", { name: /hans/i });
    await expect(userButton).toBeInTheDocument();
    await userEvent.click(userButton);
    await expect(canvas.getByRole("menuitem", { name: /dashboard/i })).toBeInTheDocument();
    await expect(canvas.getByRole("menuitem", { name: /logout/i })).toBeInTheDocument();
  },
};

export const MobileMenu: Story = {
  args: {
    auth: null,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /toggle navigation/i }));
    await expect(canvas.getByRole("link", { name: /beer styles/i })).toBeInTheDocument();
  },
};
