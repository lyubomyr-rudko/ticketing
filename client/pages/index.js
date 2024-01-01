import Link from "next/link";
import buildClient from "../api/build-client";

function LandingPage({ currentUser, tickets }) {
  console.log(111, tickets);

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.title}</td>
              <td>{ticket.price}</td>
              <td>
                <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data: tickets } = await client.get("/api/tickets");

  return { tickets };
};

export default LandingPage;
