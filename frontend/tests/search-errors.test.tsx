import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SearchPanel } from "../src/components/portal/SearchPanel";
import { errorMessage } from "../src/lib/error-messages";

describe("search validation and error messages", () => {
  it("maps forbidden error", () => {
    const error = { response: { data: { error: { code: "FORBIDDEN" } } } };

    expect(errorMessage(error)).toBe("접근 권한이 없습니다.");
  });

  it("shows empty query validation", () => {
    render(
      <MemoryRouter>
        <SearchPanel />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("검색"));

    expect(screen.getByText("검색어를 입력해 주세요.")).toBeInTheDocument();
  });
});
