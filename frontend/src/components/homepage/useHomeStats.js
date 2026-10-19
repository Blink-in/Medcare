import { useEffect, useState } from "react";
import { getDepartments } from "../../services/departmentService";
import { getDoctors } from "../../services/doctorService";

const useHomeStats = () => {
  const [stats, setStats] = useState({ departments: 0, doctors: 0 });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [deptResult, docResult] = await Promise.allSettled([
        getDepartments(),
        getDoctors(),
      ]);

      if (!active) return;

      const departments =
        deptResult.status === "fulfilled"
          ? (
              deptResult.value.departments ||
              deptResult.value.data?.departments ||
              []
            ).filter((item) => item.isActive !== false).length
          : 0;

      const doctors =
        docResult.status === "fulfilled"
          ? (
              docResult.value.doctors ||
              docResult.value.data?.doctors ||
              []
            ).filter(
              (doctor) =>
                doctor.isActive !== false &&
                doctor.user?.isActive !== false &&
                doctor.isVerified !== false
            ).length
          : 0;

      setStats({ departments, doctors });
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return stats;
};

export default useHomeStats;