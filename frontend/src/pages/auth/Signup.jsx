import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  HeartPulse,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { SignupForm } from "../../components/signup-form";
import { signup } from "../../services/authService";

const doctorImage =
  "https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg?cs=srgb&dl=pexels-kooldark-14438788.jpg&fm=jpg";

const Signup = () => {
  const navigate = useNavigate();
   const { getMe } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    address: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const allergies = formData.allergies
        ? formData.allergies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const patientDetails = {
        allergies,
      };

      if (formData.dateOfBirth) {
        patientDetails.dateOfBirth = formData.dateOfBirth;
      }

      if (formData.gender) {
        patientDetails.gender = formData.gender;
      }

      if (formData.bloodType) {
        patientDetails.bloodType = formData.bloodType;
      }

      if (formData.address.trim()) {
        patientDetails.address = formData.address.trim();
      }

      if (
        formData.emergencyContactName.trim() ||
        formData.emergencyContactRelationship.trim() ||
        formData.emergencyContactPhone.trim()
      ) {
        patientDetails.emergencyContact = {
          name: formData.emergencyContactName.trim(),
          relationship:
            formData.emergencyContactRelationship.trim(),
          phone: formData.emergencyContactPhone.trim(),
        };
      }

      const result = await signup({
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  email: formData.email.trim(),
  password: formData.password,
  phone: formData.phone.trim(),
  ...patientDetails,
});

await getMe();

navigate("/patient/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[52%_48%]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#e8f8f0] lg:block">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-[#c9f1df]/70" />

          <div className="absolute -bottom-48 -left-24 h-[520px] w-[620px] rounded-full bg-[#b7e8d3]/70" />

          <div className="absolute right-[-180px] top-[-130px] h-[500px] w-[500px] rounded-full border-[90px] border-white/50" />

          <div className="absolute bottom-[-260px] right-[-180px] h-[560px] w-[560px] rounded-full border-[80px] border-[#9eddbf]/40" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col px-10 py-9 xl:px-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#118961] text-white shadow-sm">
              <HeartPulse
                className="h-6 w-6"
                strokeWidth={2.5}
              />
            </div>

            <div>
              <h1 className="text-[25px] font-bold leading-none tracking-tight text-[#12372b]">
                MedCare
              </h1>

              <p className="mt-1 text-[11px] font-medium tracking-wide text-[#4f7869]">
                Hospital Management System
              </p>
            </div>
          </div>

          <div className="relative flex flex-1 items-center">
            <div className="absolute left-0 top-[17%] z-20 max-w-[310px]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2c9c77]">
                Better together
              </p>

              <h2 className="text-[38px] font-bold leading-[1.08] tracking-[-0.03em] text-[#103b2d] xl:text-[44px]">
                Advanced care
                <br />
                for a healthier
                <br />
                tomorrow.
              </h2>

              <p className="mt-5 max-w-[270px] text-[14px] leading-6 text-[#5d7d71]">
                Empowering healthcare professionals with
                the tools to deliver exceptional patient
                care.
              </p>
            </div>

            <div className="absolute bottom-[2%] right-[-10px] z-10 h-[88%] w-[52%] xl:right-[2%] xl:w-[50%]">
              <div className="absolute inset-0 rounded-[45%_45%_0_0] bg-[#c6f0dd]" />

              <img
                src={doctorImage}
                alt="Doctor wearing a stethoscope"
                className="absolute bottom-0 left-1/2 h-full w-full -translate-x-1/2 rounded-t-[50%] object-cover object-top mix-blend-multiply"
              />

              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#bcebd5] via-[#bcebd5]/40 to-transparent" />
            </div>

            <div className="absolute bottom-[8%] left-0 z-30 flex items-center gap-0">
              <div className="w-[105px] border-r border-[#acd8c3] pr-5">
                <UsersRound className="mb-3 h-5 w-5 text-[#168c65]" />

                <p className="text-[12px] font-bold text-[#174635]">
                  Expert Team
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#668579]">
                  Skilled professionals
                </p>
              </div>

              <div className="w-[125px] border-r border-[#acd8c3] px-5">
                <Activity className="mb-3 h-5 w-5 text-[#168c65]" />

                <p className="text-[12px] font-bold text-[#174635]">
                  Quality Care
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#668579]">
                  Better outcomes
                </p>
              </div>

              <div className="w-[125px] pl-5">
                <Stethoscope className="mb-3 h-5 w-5 text-[#168c65]" />

                <p className="text-[12px] font-bold text-[#174635]">
                  Trusted System
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#668579]">
                  Simple & reliable
                </p>
              </div>
            </div>

            <div className="absolute bottom-[-20px] left-[-70px] h-[230px] w-[500px] rotate-[18deg] rounded-[50%] border-t border-[#7acba7]/60" />

            <div className="absolute bottom-[3%] right-[8%] z-30 hidden xl:block">
              <div className="flex items-center gap-3 text-[#5d9b83]">
                <div className="h-px w-8 bg-[#75c6a0]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                  Healthcare for a better tomorrow
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-30 flex items-center justify-between border-t border-[#c5e6d6] pt-4">
            <p className="text-[10px] text-[#719287]">
              © 2026 MedCare
            </p>

            <p className="text-[10px] text-[#719287]">
              Better healthcare starts here
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#fbfdfc] px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[500px]">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#118961] text-white">
                <HeartPulse className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-[21px] font-bold leading-none text-[#12372b]">
                  MedCare
                </h1>

                <p className="mt-1 text-[10px] text-[#718078]">
                  Hospital Management System
                </p>
              </div>
            </div>
          </div>

          <SignupForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </section>
    </main>
  );
};

export default Signup;