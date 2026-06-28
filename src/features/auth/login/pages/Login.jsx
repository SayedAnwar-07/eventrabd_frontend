import LoginForm from "@/features/auth/login/components/LoginForm";
import logo from "../../../../../public/logo-png.png";

const Login = () => {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row">
        <div className="lg:w-1/2">
          <img src={logo} alt="Eventra BD" />
        </div>
        <div className="lg:w-1/2 text-start">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
