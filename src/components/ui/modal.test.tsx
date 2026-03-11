import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ConfirmModal,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "./modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={jest.fn()}>
        <ModalContent>hidden</ModalContent>
      </Modal>
    );

    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("calls onClose when the overlay is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();

    const { container } = render(
      <Modal open onClose={onClose}>
        <ModalContent>내용</ModalContent>
      </Modal>
    );

    const overlay = container.querySelector(".absolute.inset-0");
    expect(overlay).not.toBeNull();
    await user.click(overlay as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the content", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();

    render(
      <Modal open onClose={onClose}>
        <ModalContent>
          <ModalHeader>제목</ModalHeader>
          <ModalBody>본문</ModalBody>
        </ModalContent>
      </Modal>
    );

    await user.click(screen.getByText("본문"));

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("ConfirmModal", () => {
  it("renders title and message, then triggers cancel and confirm actions", async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const user = userEvent.setup();

    render(
      <ConfirmModal
        open
        onClose={onClose}
        onConfirm={onConfirm}
        title="삭제 확인"
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="유지"
      />
    );

    expect(screen.getByText("삭제 확인")).toBeInTheDocument();
    expect(screen.getByText("정말 삭제하시겠습니까?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "유지" }));
    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("applies the destructive confirm style when requested", () => {
    render(
      <ConfirmModal
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="삭제 확인"
        message="정말 삭제하시겠습니까?"
        confirmVariant="destructive"
      />
    );

    expect(screen.getByRole("button", { name: "확인" })).toHaveClass("bg-[#E7000B]");
  });
});
