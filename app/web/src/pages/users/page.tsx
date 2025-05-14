import { getUsers } from "@/api/usersApi";
import type { User } from "@/types";
import { useEffect, useState } from "react";

export const HomePage = () => {
    const [data, setData] = useState<User[]>([]);
    useEffect(() => {
        getUsers()
        .then((response) => { setData(response.data)})
        .catch((error) => console.error(error))
    }, [])
    return <table>
      <thead>
        <tr><th>DNI</th><th>Name</th><th>Email</th><th>Phone</th></tr>
      </thead>
      <tbody>
        {data.map(u => (
          <tr key={u.dni}>
            <td>{u.dni}</td>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.phone}</td>
          </tr>
        ))}
      </tbody>
    </table>;
};
