/**
 * Created by ferrynico on 15/08/2016.
 */

import javax.websocket.WebSocketContainer;
import io.advantageous.ddp.*;
import io.advantageous.ddp.rpc.RPCClient;
import io.advantageous.ddp.rpc.RPCClientImpl;
import io.advantageous.ddp.subscription.JsonObjectConverter;
import io.advantageous.ddp.subscription.MapSubscriptionAdapter;
import io.advantageous.ddp.subscription.SubscriptionAdapter;
import io.advantageous.ddp.subscription.message.AddedMessage;
import io.advantageous.ddp.subscription.message.ChangedMessage;
import io.advantageous.ddp.subscription.message.SubscribeMessage;
import org.glassfish.tyrus.client.ClientManager;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class main {

    public static void main(String args[]){
        WebSocketContainer container = ClientManager.createClient();
        MessageConverter messageConverter = new JsonMessageConverter();

        DDPMessageEndpoint endpoint = new DDPMessageEndpointImpl(container, messageConverter);
        final RPCClient rpcClient = new RPCClientImpl(endpoint);

        endpoint.registerHandler(ConnectedMessage.class, message ->
                System.out.println("connected to server! session: " + message.getSession()));


        Map<String, Map<String, Object>> dataMap = new HashMap<>();

        SubscriptionAdapter adapter = new MapSubscriptionAdapter(
                endpoint,
                new JsonObjectConverter(),
                dataMap
        );

        endpoint.registerHandler(AddedMessage.class, message -> {
            System.out.println(">>"+message);
        });

        endpoint.registerHandler(ChangedMessage.class, message -> {
            System.out.println("-------------------"+message.getFields());

            try {
                rpcClient.call("lastVersion", null, result -> {
                    System.out.println(result.toString());
                }, failureMessage -> {
                   System.out.println(failureMessage.getReason());
                });
            } catch (IOException e) {
                e.printStackTrace();
            }
        });


        try {
            endpoint.connect("ws://localhost:3000/websocket");
            endpoint.await();

        } catch (InterruptedException | IOException e) {
            e.printStackTrace();
        }
    }

}
