import LoginForm from "@/features/auth/login/components/LoginForm";

const Login = () => {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center">
        <div className="lg:w-1/2 text-start">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
