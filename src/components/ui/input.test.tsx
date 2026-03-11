import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search, Eye } from "lucide-react";
import { Input } from "./input";

describe("Input", () => {
  it("renders label, helper text and required marker", () => {
    render(
      <Input
        label="이메일"
        helperText="학교 이메일을 입력하세요."
        required
        placeholder="email@example.com"
      />
    );

    expect(screen.getByRole("textbox", { name: /이메일/ })).toBeInTheDocument();
    expect(screen.getByText("학교 이메일을 입력하세요.")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows error message instead of helper text when an error exists", () => {
    render(
      <Input
        label="비밀번호"
        helperText="8자 이상"
        errorMessage="비밀번호를 입력하세요."
      />
    );

    expect(screen.getByText("비밀번호를 입력하세요.")).toBeInTheDocument();
    expect(screen.queryByText("8자 이상")).not.toBeInTheDocument();
  });

  it("supports typing with icons and addons", async () => {
    const user = userEvent.setup();

    render(
      <Input
        aria-label="검색"
        leftIcon={<Search aria-hidden="true" />}
        rightIcon={<Eye aria-hidden="true" />}
        leftAddon="@"
        rightAddon=".com"
      />
    );

    const input = screen.getByRole("textbox", { name: "검색" });
    await user.type(input, "qknou");

    expect(input).toHaveValue("qknou");
    expect(screen.getByText("@")).toBeInTheDocument();
    expect(screen.getByText(".com")).toBeInTheDocument();
  });
});
