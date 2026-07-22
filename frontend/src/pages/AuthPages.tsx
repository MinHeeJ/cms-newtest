import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { client } from "../api";
import { useAuth } from "../auth/AuthContext";
import { Field, FormPage } from "../components/ui";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/notices");
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "로그인에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage title="로그인">
      <form onSubmit={submit}>
        <Field
          label="Email"
          required
          value={email}
          onChange={setEmail}
          type="email"
        />
        <Field
          label="Password"
          required
          value={password}
          onChange={setPassword}
          type="password"
        />
        {error && <p className="field-error mb-[21px]">{error}</p>}
        <button
          className="btn-primary w-full"
          disabled={!email || !password || loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
        <Link
          className="mt-4 block text-center font-semibold text-[#4BC8C4] transition-colors duration-200 hover:text-[#0AA49F]"
          to="/signup"
        >
          회원가입 링크
        </Link>
      </form>
    </FormPage>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const strong = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
    password,
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await client.signup({ email, nickname, password });
      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "회원가입에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage title="회원가입">
      <form onSubmit={submit}>
        <Field
          label="Email"
          required
          value={email}
          onChange={setEmail}
          type="email"
        />
        <Field
          label="Nickname"
          required
          value={nickname}
          onChange={setNickname}
        />
        <Field
          label="Password"
          required
          value={password}
          onChange={setPassword}
          type="password"
        />
        <div className="mb-[21px]">
          <div className="h-2 rounded-full bg-[#EEEEEE]">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${strong ? "w-full bg-[#4BC8C4]" : "w-1/3 bg-red-400"}`}
            />
          </div>
          <p className="mt-2 text-sm text-[#888888]">
            최소 8자, 영문+숫자+특수문자 조합
          </p>
        </div>
        {error && <p className="field-error mb-[21px]">{error}</p>}
        <button
          className="btn-primary w-full"
          disabled={!email || !nickname || !strong || loading}
        >
          {loading ? "가입 중..." : "가입하기"}
        </button>
      </form>
    </FormPage>
  );
}
